import { FunctionComponent } from "react";
import React from 'react';
import { ButtonError } from "../../../shared/utils/errorHandling";

interface CustomButtonProps {
    onClick: () => void;
    style?: string;
    symbol: string;
    id:string;
}

const CustomButton: FunctionComponent<CustomButtonProps> = ({ onClick, style, symbol, id }) => {

    if (typeof style !== 'string' && !React.isValidElement(style)) {
        throw new ButtonError('CustomButton component requires a valid "style" prop, which can be a CSS class (string).');
    }

    return (
        <div className={style} data-testid="custom-button">
            <button type="button" onClick={onClick} data-testid={`custom-button-${id}`}>
                {symbol}
            </button>
        </div>
    );
};

export default CustomButton;