type JsonLdValue =
  Record<
    string,
    unknown
  >
  |
  Record<
    string,
    unknown
  >[];

type Props = {
  data:
    JsonLdValue;
};

function escapeJsonLd(
  data:
    JsonLdValue
) {
  return JSON
    .stringify(
      data
    )
    .replace(
      /</g,
      '\\u003c'
    );
}

export default function JsonLd({
  data,
}: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html:
          escapeJsonLd(
            data
          ),
      }}
    />
  );
}