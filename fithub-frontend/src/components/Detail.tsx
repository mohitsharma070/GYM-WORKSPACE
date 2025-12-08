export default function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 border rounded">
      <p className="text-gray-600">{label}</p>
      <p className="font-semibold">{value ?? "-"}</p>
    </div>
  );
}
