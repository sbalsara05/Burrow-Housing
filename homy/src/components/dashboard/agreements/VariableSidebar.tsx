import React from 'react';

interface VariableSidebarProps {
    variables: Record<string, string>;
    onUpdate: (key: string, value: string) => void;
}

const VariableSidebar: React.FC<VariableSidebarProps> = ({ variables, onUpdate }) => {
    const keys = Object.keys(variables);

    return (
        <div className="bg-white card-box border-20 p-4 h-100">
            <h4 className="dash-title-three mb-4">Contract Variables</h4>
            <p className="fs-16 mb-4 text-muted">
                Values entered here will replace the <code>{`{{Placeholders}}`}</code> in the document preview.
            </p>

            {keys.length === 0 ? (
                <div className="alert alert-info">
                    No variables detected. Type <code>{`{{Variable_Name}}`}</code> in the editor to create one.
                </div>
            ) : (
                <form onSubmit={(e) => e.preventDefault()}>
                    {keys.map((key) => (
                        <div className="dash-input-wrapper mb-30" key={key}>
                            <label className="form-label fw-500">{key.replace(/_/g, ' ')}</label>
                            <input
                                type="text"
                                className="form-control" // Matches your theme's input style
                                value={variables[key]}
                                onChange={(e) => onUpdate(key, e.target.value)}
                                placeholder={`Enter ${key}`}
                                style={{ height: '50px', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '0 20px' }}
                            />
                        </div>
                    ))}
                </form>
            )}
        </div>
    );
};

export default VariableSidebar;