

const TextField = ({ label, value, onChange, type, hint, required }) => {
    return (<>
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
        }}>
            <span style={{
                fontWeight: "bold",
                fontSize: "14px"

            }}>{label}</span>
            <input
                required={required}
                style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc"

                }} value={value} onChange={onChange} type={type} placeholder={hint}></input>
        </div>


    </>);
}

export default TextField;
