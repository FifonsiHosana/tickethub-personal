import { CircularProgress } from "react-loader-spinner";

interface LoaderProps {
  height?: string | number;
  width?: string | number;
  color?: string;
  ariaLabel?: string;
  className?: string;
  fullScreen?: boolean;
  loading: boolean;
}

export const Loader = ({
  height = "80",
  width = "80",
  color = "var(--primary)",
  ariaLabel = "tail-spin-loading",
  className = "",
  fullScreen = true,
  loading,
}: LoaderProps) => {
  const loaderContent = (
    <div
      className={`flex items-center justify-center ${
        fullScreen
          ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          : "w-full h-full"
      } ${className}`}
    >
      <CircularProgress
        height={height}
        width={width}
        color={color}
        ariaLabel={ariaLabel}
        // radius="1"
        visible={loading}
      />
    </div>
  );

  return loaderContent;
};

export default Loader;
