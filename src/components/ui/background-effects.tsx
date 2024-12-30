export const BackgroundEffects = () => {
    return (
      <>
        {/* Animated Background */}
        <div className="fixed inset-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-black to-black animate-gradient" />
          <div className="absolute inset-0">
            <div className="absolute inset-0 glow-effect" />
          </div>
          <div className="absolute inset-0 glass-morphism opacity-30" />
          <div className="absolute inset-0 radial-background opacity-20" />
        </div>
      </>
    );
  };