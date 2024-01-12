type payloadType = {
  value: string | number;
  name: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: payloadType[];
  label?: number;
}

export default function CustomTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-accent text-accent-foreground rounded-md shadow-md p-2">
        {label}
        {payload.map((pld: payloadType) => (
          <p key={pld.name} className="text-sm text-white">
            {`${pld.name} : ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
