import type React from 'react';
import type { Thing, WithContext } from 'schema-dts';
type JsonLdProps = {
  code: WithContext<Thing>;
};

export const JsonLd: React.FC<JsonLdProps> = ({ code }) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: "This is a JSON-LD script, not user-generated content."
    dangerouslySetInnerHTML={{ __html: JSON.stringify(code) }}
  />
);

export * from 'schema-dts';
