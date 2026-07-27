import React from 'react';

interface Props {
  specs?: any;
}

export default function ProductSpecs({ specs }: Props) {
  if (!specs) return null;

  // If specs is a JSON string, try parse
  let value = specs;
  if (typeof specs === 'string') {
    try {
      const parsed = JSON.parse(specs);
      value = parsed;
    } catch (e) {
      // plain string — render as paragraph
      return <p className="whitespace-pre-wrap">{specs}</p>;
    }
  }

  // If it's an array, render list
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5">
        {value.map((v, i) => <li key={i}>{String(v)}</li>)}
      </ul>
    );
  }

  // If it's an object, render table
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return null;
    return (
      <table className="w-full border-collapse">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} className="border-t">
              <td className="py-2 px-3 align-top font-semibold w-1/3">{k}</td>
              <td className="py-2 px-3">{String(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Fallback
  return <p>{String(specs)}</p>;
}
