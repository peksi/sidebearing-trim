import React from "react";
import { Sidebearing } from "sidebearing-trim/react";

type Props = {
  text: string;
  fontSource: string;
};

export function Example({ text, fontSource }: Props) {
  return (
    <Sidebearing
      as="p"
      fontSource={fontSource}
      trim
      style={{ fontSize: "72px", lineHeight: 1.25, whiteSpace: "pre-wrap" }}
    >
      {text}
    </Sidebearing>
  );
}
