const BatLogo = ({ className = "w-8 h-8", color = "currentColor" }) => (
    <svg
        viewBox="0 0 100 60"
        className={className}
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M50 55C35 55 25 45 15 35C10 30 5 25 2 20C5 20 10 22 15 22C20 22 25 18 28 15C30 12 32 8 35 10C38 12 40 18 42 20C45 22 48 22 50 20C52 22 55 22 58 20C60 18 62 12 65 10C68 8 70 12 72 15C75 18 80 22 85 22C90 22 95 20 98 20C95 25 90 30 85 35C75 45 65 55 50 55Z" />
    </svg>
);

export default BatLogo;
