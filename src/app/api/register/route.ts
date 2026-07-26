import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, companyName, contactPerson, contactNumber, email, city, buyerType } = body;

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { success: false, message: "Registration type is required." },
        { status: 400 }
      );
    }

    if (type === "buyer" && (!buyerType || !city || !contactNumber)) {
      return NextResponse.json(
        { success: false, message: "Missing required buyer registration fields." },
        { status: 400 }
      );
    }

    if (type === "exhibitor" && (!companyName || !contactPerson || !email || !contactNumber)) {
      return NextResponse.json(
        { success: false, message: "Missing required exhibitor registration fields." },
        { status: 400 }
      );
    }

    // Log the lead for server recording / webhook forwarding
    console.log(`[STE 2026 REGISTRATION RECEIVED] Type: ${type}`, body);

    // If RESEND_API_KEY environment variable exists, forward lead email
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "STE Registrations <noreply@stesurat.com>",
            to: ["contact@stesurat.com"],
            subject: `New ${type.toUpperCase()} Registration: ${companyName || contactPerson}`,
            json: body,
          }),
        });
      } catch (emailErr) {
        console.warn("Resend email forwarding fallback:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully. The STE 2026 organizing team will contact you within 24 hours.",
        leadId: `STE-${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration submission error:", error);
    return NextResponse.json(
      { success: false, message: "Server error processing registration. Please try again or connect via WhatsApp." },
      { status: 500 }
    );
  }
}
