import emailjs
  from '@emailjs/browser';

type InquiryData = {
  name: string;

  email: string;

  phoneNumber: string;

  propertyTitle: string;

  unitType?: string;

  price?: number;

  pricePeriod?: string;

  preferredInspectionDate?: string;

  message?: string;
};

function formatInquiryPrice(
  price?: number,
  pricePeriod?: string
) {
  if (
    !price ||
    price <= 0
  ) {
    return 'Contact for price';
  }

  const formatted =
    new Intl.NumberFormat(
      'en-NG',
      {
        style: 'currency',

        currency: 'NGN',

        maximumFractionDigits:
          0,
      }
    ).format(price);

  if (
    !pricePeriod ||
    pricePeriod ===
      'one-time'
  ) {
    return formatted;
  }

  return `${formatted}/${pricePeriod}`;
}

export const sendInquiryEmail =
  async (
    inquiryData:
      InquiryData
  ) => {
    const contactEmail =
      process.env
        .NEXT_PUBLIC_CONTACT_EMAIL ||
      'bolsimfarmss@gmail.com';

    const templateParams = {
      to_email:
        contactEmail,

      from_name:
        inquiryData.name,

      from_email:
        inquiryData.email,

      phone:
        inquiryData.phoneNumber,

      property:
        inquiryData.propertyTitle,

      unit:
        inquiryData.unitType ||
        'N/A',

      price:
        formatInquiryPrice(
          inquiryData.price,
          inquiryData.pricePeriod
        ),

      inspection_date:
        inquiryData.preferredInspectionDate ||
        'Not specified',

      message:
        inquiryData.message ||
        'No additional message provided.',
    };

    try {
      const response =
        await emailjs.send(
          process.env
            .NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
            '',

          process.env
            .NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
            '',

          templateParams,

          process.env
            .NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
            ''
        );

      return {
        success:
          true,

        response,
      };
    } catch (error) {
      console.error(
        'Living Spring email sending failed:',
        error
      );

      return {
        success:
          false,

        error,
      };
    }
  };

export const getWhatsAppMessage =
  (
    inquiryData:
      InquiryData
  ) => {
    const formattedPrice =
      formatInquiryPrice(
        inquiryData.price,
        inquiryData.pricePeriod
      );

    return `Hello Living Spring,

My name is ${inquiryData.name}.

I am interested in:

Property: ${inquiryData.propertyTitle}
Unit: ${inquiryData.unitType || 'Property'}
Price: ${formattedPrice}

Preferred inspection date:
${
  inquiryData.preferredInspectionDate ||
  'To be scheduled'
}

Please contact me at ${inquiryData.phoneNumber} or ${inquiryData.email}.

Message:
${
  inquiryData.message ||
  'I would like more information about this property.'
}`;
  };