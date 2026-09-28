export function Card({ className = "", children }) {
  return (
    <div className={`glass-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
}