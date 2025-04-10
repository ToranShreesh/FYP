const Button = ({ label, onClick, type, style }) => {
    return (<>
        <button style={{
            cursor: "pointer",
            padding: "10px",
            backgroundColor: "#0071c2",
            border: "none",
            color: "white",
            borderRadius: "5px",
           
            fontWeight: "500",
            ...style
        }} type={type} onClick={(e) => {
            onClick && onClick(e)
        }}>{label}</button>
    </>);
}

export default Button;
