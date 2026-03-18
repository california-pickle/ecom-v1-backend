export const getRefundTemplate = (
  firstName: string,
  itemName: string,
  itemSizeLabel: string,
  refundAmount: number,
) => {
  const currentYear = new Date().getFullYear();
  const black = "#000000";
  const bodyBg = "#f3f4f6";
  const logoUrl =
    "https://res.cloudinary.com/dngag0zog/image/upload/pickle-logo_mp20aq.png";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Refund — The California Pickle</title>
<style>
  body { margin:0; padding:0; }
  table { border-collapse:collapse; }
  @media only screen and (max-width: 600px) {
    .container { width:100% !important; }
    .padding { padding:30px 24px !important; }
  }
</style>
</head>

<body style="background-color:${bodyBg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; margin:0; padding:0;">

<div style="display:none; max-height:0; overflow:hidden; opacity:0;">
We're sorry — your order has been fully refunded.
</div>

<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 20px;">
<tr>
<td align="center">

<table width="600" class="container" cellpadding="0" cellspacing="0" role="presentation"
style="width:100%; max-width:600px; background-color:#ffffff; border:3px solid ${black}; border-radius:10px; overflow:hidden;">

<!-- HEADER -->
<tr>
<td align="center" style="background-color:#111827; padding:32px 20px; border-bottom:3px solid ${black};">
  <img src="${logoUrl}" width="155" alt="The California Pickle" style="display:block; max-width:100%; height:auto;" />
</td>
</tr>

<!-- BODY -->
<tr>
<td class="padding" style="padding:40px;">

<h1 style="margin:0 0 20px; font-size:26px; font-weight:900; font-family:'Arial Black',Impact,sans-serif; text-transform:uppercase; color:#111827;">
We're Sorry, ${firstName}
</h1>

<p style="margin:0 0 24px; font-size:16px; line-height:26px; color:#4b5563;">
By the time your payment was processed, <strong>${itemName} — ${itemSizeLabel}</strong> had sold out. We completely understand how frustrating this is and we're truly sorry.
</p>

<!-- REFUND BOX -->
<div style="border:2px solid #e5e7eb; border-radius:8px; padding:24px; margin-bottom:30px; background-color:#f9fafb;">
  <p style="margin:0 0 8px; font-size:11px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:1px;">Refund Issued</p>
  <p style="margin:0; font-size:28px; font-weight:900; font-family:'Arial Black',Impact,sans-serif; color:#111827;">$${refundAmount.toFixed(2)}</p>
  <p style="margin:8px 0 0; font-size:14px; color:#6b7280;">Refunds typically appear on your card within <strong>5–10 business days</strong> depending on your bank.</p>
</div>

<p style="margin:0 0 16px; font-size:15px; line-height:24px; color:#4b5563;">
No action is needed on your end — the full amount has been automatically returned to your original payment method.
</p>

<p style="margin:0; font-size:15px; line-height:24px; color:#4b5563;">
If you have any questions, reply to this email or contact us at <a href="mailto:support@thecaliforniapickle.com" style="color:#65a30d; font-weight:700;">support@thecaliforniapickle.com</a>.
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="background-color:${black}; padding:26px 20px;">
<p style="margin:0; font-size:11px; color:#ffffff; font-family:'Arial Black',Impact,sans-serif; text-transform:uppercase; letter-spacing:1.5px;">
© ${currentYear} The California Pickle.<br>
All Rights Reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
  `;
};
