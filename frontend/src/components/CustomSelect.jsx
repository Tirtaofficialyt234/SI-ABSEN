import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * Modern Select component with floating menu, micro-interactions,
 * search-ready style, and click-outside dismissal.
 */
export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = "Pilih opsi...",
    icon: Icon = null,
    name = "",
    required = false,
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (val) => {
        onChange({
            target: {
                name: name,
                value: val,
            },
        });
        setIsOpen(false);
    };

    return (
        <div className="custom-select-wrapper" ref={dropdownRef}>
            {/* Hidden native input for required validation if needed */}
            {required && (
                <input
                    type="text"
                    tabIndex={-1}
                    value={value || ""}
                    onChange={() => {}}
                    required={required}
                    style={{
                        opacity: 0,
                        position: "absolute",
                        pointerEvents: "none",
                        height: 0,
                        width: 0,
                        bottom: 0,
                    }}
                />
            )}

            <button
                type="button"
                className={`custom-select-trigger ${isOpen ? "custom-select-trigger--open" : ""} ${
                    !value ? "custom-select-trigger--placeholder" : ""
                } ${disabled ? "custom-select-trigger--disabled" : ""}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                {Icon && <Icon size={16} className="custom-select-icon" />}
                <span className="custom-select-label">{displayLabel}</span>
                <ChevronDown
                    size={16}
                    className={`custom-select-chevron ${isOpen ? "custom-select-chevron--rotate" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="custom-select-menu">
                    {options.length === 0 ? (
                        <div className="custom-select-empty">Tidak ada pilihan</div>
                    ) : (
                        options.map((opt) => {
                            const isSelected = String(value) === String(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`custom-select-item ${
                                        isSelected ? "custom-select-item--selected" : ""
                                    }`}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <Check size={14} className="custom-select-check" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

