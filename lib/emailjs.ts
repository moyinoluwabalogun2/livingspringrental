import emailjs from 'emailjs-com';

export const sendInquiryEmail = async (inquiryData: any) => {
  const templateParams = {
    to_email: 'admin@livingsprings.com',
    from_name: inquiryData.name,
    from_email: inquiryData.email,
    phone: inquiryData.phoneNumber,
    property: inquiryData.propertyTitle,
    unit: inquiryData.unitType || 'N/A',
    price: inquiryData.price ? `₦${inquiryData.price.toLocaleString()}` : 'N/A',
    inspection_date: inquiryData.preferredInspectionDate,
    message: inquiryData.message,
  };

  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
    return { success: true, response };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const getWhatsAppMessage = (inquiryData: any) => {
  return `Hello,

My name is ${inquiryData.name}.

I am interested in:

Property: ${inquiryData.propertyTitle}
Unit: ${inquiryData.unitType || 'Property'}
Price: ₦${inquiryData.price?.toLocaleString() || 'Contact for price'}

Preferred inspection date:
${inquiryData.preferredInspectionDate || 'To be scheduled'}

Please contact me at ${inquiryData.phoneNumber} or ${inquiryData.email}.

Message: ${inquiryData.message}`;
};