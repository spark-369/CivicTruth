const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-7xl',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
};

export default function PageContainer({ children, maxWidth = "lg", sx = {} }) {
  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${maxWidthMap[maxWidth] || 'max-w-7xl'} ${sx.className || ""}`}
      style={sx}
    >
      {children}
    </div>
  );
}