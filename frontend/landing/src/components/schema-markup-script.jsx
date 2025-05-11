import React from 'react';


function SchemaMarkupScript({ }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cognato AI',
    url: 'https://cognatoai.com',
    logo: 'https://cognatoai.com/logo/supermodal.webp',
    sameAs: ['https://www.linkedin.com/company/cognato-ai'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default SchemaMarkupScript;