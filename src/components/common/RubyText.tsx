interface RubyTextProps {
  text: string;
  ruby: string;
}

export default function RubyText({ text, ruby }: RubyTextProps) {
  return (
    <ruby>
      {text}
      <rp>(</rp>
      <rt className="text-[0.6em]">{ruby}</rt>
      <rp>)</rp>
    </ruby>
  );
}
