interface Props {
    rows: any[];
}

export default function CaseTable({ rows }: Props) {
    if (!rows || rows.length === 0) {
        return (
            <div className="text-sm text-gray-400 text-center py-6 border rounded-lg">
                No results found
            </div>
        );
    }

    const columns = Object.keys(rows[0]);

    return (
        <div className="border rounded-lg overflow-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map(col => (
                            <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 border-b">
                                {col.replace(/_/g, ' ').toUpperCase()}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                            {columns.map(col => (
                                <td key={col} className="px-4 py-2 text-gray-700">
                                    {String(row[col] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}