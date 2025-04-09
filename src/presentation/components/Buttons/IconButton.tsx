interface IconButtonProps {
    onClick: () => void;
    icon: string;
    id?:string;
}

export const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, id='' }) => (
    <span onClick={onClick} data-testid={`icon-button${id}`}>
        <img src={icon} alt="imgAltText" />
    </span>
);