import { safeDisplay } from "xss-safe-display";

interface IconButtonProps {
  onClick: () => void;
  icon: string;
  id?: string;
  altText?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  id = "",
  altText = "icon button",
}) => (
  <span onClick={onClick} data-testid={`icon-button${id}`}>
    <img src={safeDisplay.url(icon)} alt={safeDisplay.text(altText)} />
  </span>
);
