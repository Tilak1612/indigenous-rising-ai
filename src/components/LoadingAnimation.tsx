const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-primary rounded-full animate-gentle-float" />
      <div className="w-3 h-3 bg-primary rounded-full animate-gentle-float" style={{ animationDelay: '0.2s' }} />
      <div className="w-3 h-3 bg-primary rounded-full animate-gentle-float" style={{ animationDelay: '0.4s' }} />
    </div>
  );
};

export default LoadingAnimation;
