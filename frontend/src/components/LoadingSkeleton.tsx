import React from 'react';

interface SkeletonProps {
    type?: 'text' | 'title' | 'avatar' | 'card' | 'table-row';
    count?: number;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({ type = 'text', count = 1 }) => {
    const renderItem = (index: number) => {
        switch (type) {
            case 'title':
                return <div key={index} className="skeleton skeleton-title" />;
            case 'avatar':
                return <div key={index} className="skeleton skeleton-avatar" />;
            case 'card':
                return <div key={index} className="skeleton skeleton-card" style={{ marginBottom: '16px' }} />;
            case 'table-row':
                return (
                    <tr key={index}>
                        <td style={{ width: '150px' }}><div className="skeleton skeleton-text" /></td>
                        <td><div className="skeleton skeleton-text" /></td>
                        <td style={{ width: '100px' }}><div className="skeleton skeleton-text" /></td>
                        <td style={{ width: '120px' }}><div className="skeleton skeleton-text" /></td>
                        <td style={{ width: '80px' }}><div className="skeleton skeleton-text" /></td>
                    </tr>
                );
            case 'text':
            default:
                return <div key={index} className="skeleton skeleton-text" />;
        }
    };

    if (type === 'table-row') {
        return (
            <>
                {Array.from({ length: count }).map((_, idx) => renderItem(idx))}
            </>
        );
    }

    return (
        <>
            {Array.from({ length: count }).map((_, idx) => renderItem(idx))}
        </>
    );
};
