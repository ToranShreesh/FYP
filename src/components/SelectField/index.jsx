

const SelectField = ({ label, value, options, onChange, type, hint, required }) => {
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

            <select style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc"
            }}
                onChange={onChange}
                value={value}
            >
                {
                    options.map((option) => {
                        return <option value={option.value}>{option.label}</option>
                    })
                }
            </select>

        </div>


    </>);
}

export default SelectField;
