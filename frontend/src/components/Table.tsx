import React, { useState } from 'react';
import { Download, FileText, Printer, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    total?: number;
    limit?: number;
    offset?: number;
    onPageChange?: (offset: number) => void;
    onSort?: (accessor: string, order: 'ASC' | 'DESC') => void;
    title: string;
}

export function Table<T extends Record<string, any>>({
    data,
    columns,
    total = 0,
    limit = 10,
    offset = 0,
    onPageChange,
    onSort,
    title
}: TableProps<T>) {
    const [sortField, setSortField] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    const handleSort = (accessor: string) => {
        const nextOrder = sortField === accessor && sortOrder === 'DESC' ? 'ASC' : 'DESC';
        setSortField(accessor);
        setSortOrder(nextOrder);
        if (onSort) onSort(accessor, nextOrder);
    };

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    // Helper utility to download CSV data
    const exportToCSV = () => {
        const headers = columns.map(c => `"${c.header}"`).join(',');
        const rows = data.map(row => {
            return columns.map(col => {
                const val = row[col.accessor as string];
                // Strip html/comma, handle objects, fallback empty
                const cleanVal = typeof val === 'object' ? '' : String(val !== undefined && val !== null ? val : '').replace(/"/g, '""');
                return `"${cleanVal}"`;
            }).join(',');
        });
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToExcel = () => {
        // Excel-compatible HTML format containing tabular layout which Excel opens natively
        let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>${title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body><table>
        <thead><tr>${columns.map(c => `<th>${c.header}</th>`).join('')}</tr></thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => {
            const val = row[col.accessor as string];
            return `<td>${typeof val === 'object' ? '' : val}</td>`;
        }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table></body></html>
    `;
        const uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(html);
        const link = document.createElement('a');
        link.setAttribute('href', uri);
        link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_export.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Table Title and Export Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={exportToCSV} title="Export CSV">
                        <Download size={14} /> CSV
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={exportToExcel} title="Export Excel">
                        <FileText size={14} /> Excel
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handlePrint} title="Print / Save PDF">
                        <Printer size={14} /> Print/PDF
                    </button>
                </div>
            </div>

            {/* Table rendering block */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => col.sortable && handleSort(col.accessor as string)}
                                    style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {col.header}
                                        {col.sortable && <ArrowUpDown size={12} style={{ color: 'var(--text-muted)' }} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                                    No records matching search patterns.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                    {columns.map((col, colIdx) => {
                                        const value = row[col.accessor as string];
                                        return (
                                            <td key={colIdx}>
                                                {col.render ? col.render(value, row) : (value !== undefined && value !== null ? String(value) : '-')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Pagination footer */}
            {total > limit && onPageChange && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({total} entries total)
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onPageChange(offset - limit)}
                            disabled={offset === 0}
                            style={{ opacity: offset === 0 ? 0.5 : 1, cursor: offset === 0 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onPageChange(offset + limit)}
                            disabled={currentPage === totalPages}
                            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Table;
