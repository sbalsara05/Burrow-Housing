import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
    onSave: (signatureData: string) => void;
    onCancel: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
    };

    const save = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            // Returns a base64 string (data:image/png;base64,...)
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    const handleDrawing = () => {
        setIsEmpty(false);
    };

    return (
        <div className="signature-pad-wrapper text-center">
            <div className="border border-2 rounded mb-3" style={{ background: '#f8f9fa' }}>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        width: 500,
                        height: 200,
                        className: 'sigCanvas'
                    }}
                    onBegin={handleDrawing}
                />
            </div>

            <div className="d-flex justify-content-between">
                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={clear}
                    disabled={isEmpty}
                >
                    Clear
                </button>
                <div className="d-flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
                    <button
                        className="btn btn-primary btn-sm text-white"
                        onClick={save}
                        disabled={isEmpty}
                        style={{ backgroundColor: '#f16040', borderColor: '#f16040' }}
                    >
                        Apply Signature
                    </button>
                </div>
            </div>
            <p className="text-muted mt-2 fs-sm">Draw your signature above</p>
        </div>
    );
};

export default SignaturePad;