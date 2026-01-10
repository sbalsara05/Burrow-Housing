import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Standard Quill styles

import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchContractById, updateDraft, lockContract } from '../../../redux/slices/contractSlice';
import VariableSidebar from './VariableSidebar';

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

    // Sync Redux state to Local state
    useEffect(() => {
        if (currentContract) {
            setEditorHtml(currentContract.templateHtml);
            setVariables(currentContract.variables || {});
        }
    }, [currentContract]);

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
            await dispatch(lockContract(id)).unwrap();
            navigate('/dashboard/my-agreements');
        } catch (error) {
            console.error("Lock contract error:", error);
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
                        <ReactQuill
                            theme="snow"
                            value={editorHtml}
                            onChange={handleEditorChange}
                            style={{ height: '450px', marginBottom: '50px' }}
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    ['clean']
                                ],
                            }}
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