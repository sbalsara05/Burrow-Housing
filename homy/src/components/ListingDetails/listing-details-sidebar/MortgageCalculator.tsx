// frontend/components/ListingDetails/listing-details-sidebar/MortgageCalculator.tsx
import React, { useState, useEffect } from 'react'; // Import React and hooks

// Define props interface
interface MortgageCalculatorProps {
    homePrice?: number | null; // Accept the property price/rent
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ homePrice }) => {
    // Local state for calculator inputs, initialized with prop or defaults
    const [price, setPrice] = useState<string>('');
    const [downPayment, setDownPayment] = useState<string>('');
    const [interestRate, setInterestRate] = useState<string>('3.5'); // Default rate
    const [loanTerm, setLoanTerm] = useState<string>('30'); // Default term

    // Effect to update local price state when prop changes
    useEffect(() => {
        // Format the number without decimals for display in input
        setPrice(homePrice ? homePrice.toFixed(0) : '');
    }, [homePrice]);

    // Basic calculation logic (example - replace with accurate formula or library)
    const calculateMortgage = () => {
        const P = parseFloat(price.replace(/,/g, '')) - parseFloat(downPayment.replace(/,/g, '')) || 0; // Principal loan amount
        const r = parseFloat(interestRate) / 100 / 12 || 0; // Monthly interest rate
        const n = parseInt(loanTerm, 10) * 12 || 0; // Total number of payments

        if (P <= 0 || r <= 0 || n <= 0) {
            return 'N/A'; // Invalid input
        }

        const M = P * [r * (1 + r) ** n] / [(1 + r) ** n - 1];
        return M > 0 ? `$${M.toFixed(2)}/mo` : 'N/A';
    };

    const monthlyPayment = calculateMortgage();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Calculation is already done, maybe just show result more prominently?
        alert(`Estimated Monthly Payment: ${monthlyPayment}`); // Placeholder alert
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="input-box-three mb-25">
                <div className="label">Home Price*</div>
                {/* Controlled input using local state */}
                <input
                    type="text" // Use text to allow formatting like commas
                    placeholder="e.g., 132,789"
                    className="type-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            <div className="input-box-three mb-25">
                <div className="label">Down Payment*</div>
                <input
                    type="text" // Use text
                    placeholder="$ e.g., 20,000"
                    className="type-input"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    required
                />
            </div>
            <div className="input-box-three mb-25">
                <div className="label">Interest Rate (%)*</div>
                <input
                    type="number" // Use number for rate input
                    step="0.01"
                    placeholder="e.g., 3.5"
                    className="type-input"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    required
                />
            </div>
            <div className="input-box-three mb-25">
                <div className="label">Loan Terms (Years)</div>
                <input
                    type="number"
                    placeholder="e.g., 30"
                    className="type-input"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    required
                />
            </div>
            {/* Optionally display the calculated result */}
            {monthlyPayment !== 'N/A' && (
                <div className="text-center fs-18 fw-500 mb-3">
                    Estimated Payment: <span className="color-dark">{monthlyPayment}</span>
                </div>
            )}
            <button type="submit" className="btn-five text-uppercase sm rounded-3 w-100 mb-10">CALCULATE</button>
        </form>
    );
};

export default MortgageCalculator;