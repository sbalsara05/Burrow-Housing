import { useState, useCallback, useRef, FC } from "react";
import { useClickAway } from "react-use";

interface Option {
    value: number;
    text: number;
}

// The onChange prop now specifically expects a function that takes a number
type NumberNiceSelectProps = {
    options: Option[];
    defaultCurrent: number;
    placeholder?: string;
    className?: string;
    onChange: (value: number) => void; // 👈 KEY CHANGE: This now returns just the number
    name: string;
}

const NumberNiceSelect: FC<NumberNiceSelectProps> = ({
    options,
    defaultCurrent,
    placeholder,
    className,
    onChange, // The function from props
}) => {
    const [open, setOpen] = useState(false);
    // Ensure current is valid, otherwise fallback to the first option or a placeholder
    const [current, setCurrent] = useState<Option>(options[defaultCurrent] || options[0] || { value: 0, text: 0 });
    const onClose = useCallback(() => {
        setOpen(false);
    }, []);
    const ref = useRef<HTMLDivElement | null>(null);

    useClickAway(ref, onClose);

    const currentHandler = (item: Option) => {
        setCurrent(item);
        onChange(item.value); // 👈 KEY CHANGE: Call the parent's onChange with just the item's value
        onClose();
    };

    return (
        <div
            className={`nice-select form-select-lg ${className || ""} ${open ? "open" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => setOpen((prev) => !prev)}
            onKeyDown={(e) => e}
            ref={ref}
        >
            <span className="current">{current?.text || placeholder}</span>
            <ul
                className="list"
                role="menubar"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                {options?.map((item, i) => (
                    <li
                        key={i}
                        data-value={item.value}
                        className={`option ${item.value === current?.value ? "selected focus" : ""}`}
                        style={{ fontSize: '14px' }}
                        role="menuitem"
                        onClick={() => currentHandler(item)}
                        onKeyDown={(e) => e}
                    >
                        {item.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NumberNiceSelect;