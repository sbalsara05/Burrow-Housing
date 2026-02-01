import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchContractById, updateDraft, lockContract } from '../../../redux/slices/contractSlice';
import VariableSidebar from './VariableSidebar';

/** Minimal rich-text editor using ref (no findDOMNode). Supports {{variables}}, bold, italic, lists. */
const SimpleRichEditor = ({
    value,
    onChange,
    placeholder = 'Enter contract text. Use {{Variable_Name}} for placeholders.',
    style,
}: {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInternal = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (el.innerHTML !== value) {
            isInternal.current = true;
            el.innerHTML = value;
            isInternal.current = false;
        }
    }, [value]);

    const handleInput = useCallback(() => {
        if (isInternal.current || !ref.current) return;
        onChange(ref.current.innerHTML);
    }, [onChange]);

    const exec = (cmd: string, value?: string) => {
        document.execCommand(cmd, false, value);
        ref.current?.focus();
        if (ref.current) onChange(ref.current.innerHTML);
    };

    return (
        <div className="border rounded p-2 bg-white" style={style}>
            <div className="d-flex gap-1 mb-2 flex-wrap">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => exec('bold')} title="Bold"><b>B</b></button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => exec('italic')} title="Italic"><i>I</i></button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => exec('underline')} title="Underline"><u>U</u></button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => exec('insertUnorderedList')} title="Bullet list">• List</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => exec('insertOrderedList')} title="Numbered list">1. List</button>
            </div>
            <div
                ref={ref}
                contentEditable
                className="form-control"
                data-placeholder={placeholder}
                onInput={handleInput}
                style={{ minHeight: '400px', outline: 'none' }}
                suppressContentEditableWarning
            />
        </div>
    );
};

const ContractBuilder = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { currentContract, isLoading, successMessage } = useSelector((state: RootState) => state.contract);

    // Local State
    const [editorHtml, setEditorHtml] = useState('');
    const [variables, setVariables] = useState<Record<string, string>>({});

    // Fetch data on mount
    useEffect(() => {
        if (id) {
            dispatch(fetchContractById(id));
        }
    }, [dispatch, id]);

    // Sync Redux state to Local state; redirect if contract is already locked
    useEffect(() => {
        if (currentContract) {
            if (currentContract.status !== 'DRAFT') {
                toast.info('This agreement is already sent. You can view it in My Agreements.');
                navigate('/dashboard/my-agreements', { replace: true });
                return;
            }
            setEditorHtml(currentContract.templateHtml);
            setVariables(typeof currentContract.variables === 'object' && currentContract.variables !== null
                ? { ...(currentContract.variables as Record<string, string>) }
                : {});
        }
    }, [currentContract, navigate]);

    // REGEX: Detect {{Variables}} 
    const extractVariables = useCallback((html: string) => {
        // Regex to find {{Word}} patterns
        const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
        const matches = [...html.matchAll(regex)];
        const foundKeys = matches.map(m => m[1]);

        setVariables(prev => {
            const newVars = { ...prev };
            // Initialize new keys with empty string if they don't exist
            foundKeys.forEach(key => {
                if (newVars[key] === undefined) {
                    newVars[key] = "";
                }
            });
            return newVars;
        });
    }, []);

    const handleEditorChange = (html: string) => {
        setEditorHtml(html);
        extractVariables(html);
    };

    const handleVariableUpdate = (key: string, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        if (id) {
            dispatch(updateDraft({
                id,
                data: {
                    templateHtml: editorHtml,
                    variables: variables
                }
            }));
        }
    };

    const handleFinalize = async () => {
        if (!id) return;

        try {
            // Save draft first so variables (dates, rent, etc.) are persisted before locking
            await dispatch(updateDraft({
                id,
                data: { templateHtml: editorHtml, variables }
            })).unwrap();

            await dispatch(lockContract(id)).unwrap();
            toast.success('Contract sent to sublessee.');
            navigate('/dashboard/my-agreements');
        } catch (error: unknown) {
            const msg = typeof error === 'string' ? error : (error as { message?: string })?.message;
            if (msg?.includes('already locked')) {
                toast.info('This agreement was already sent. Redirecting to My Agreements.');
                navigate('/dashboard/my-agreements', { replace: true });
            } else {
                toast.error(msg || 'Failed to finalize contract.');
            }
        }
    };
    if (isLoading && !currentContract) return <div className="p-5 text-center">Loading Builder...</div>;

    return (
        <div className="row">
            {/* Left: The Document Editor */}
            <div className="col-xl-8 col-lg-7">
                <div className="bg-white card-box border-20 p-4 mb-4 mb-lg-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="dash-title-three">Contract Editor</h4>
                        {successMessage && <span className="text-success fw-500">{successMessage}</span>}
                    </div>

                    <div className="editor-wrapper" style={{ minHeight: '500px' }}>
                        <SimpleRichEditor
                            value={editorHtml}
                            onChange={handleEditorChange}
                            style={{ marginBottom: '1rem' }}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                        <button className="dash-btn-two tran3s bg-black text-white" onClick={handleSave}>
                            Save Draft
                        </button>
                        <button className="dash-btn-two tran3s" onClick={handleFinalize}>
                            Finalize & Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: The Variable Inputs */}
            <div className="col-xl-4 col-lg-5">
                <VariableSidebar
                    variables={variables}
                    onUpdate={handleVariableUpdate}
                />
            </div>
        </div>
    );
};

export default ContractBuilder;