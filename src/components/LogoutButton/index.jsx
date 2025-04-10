import toast from "react-hot-toast";
import { baseUrl } from "../../constants";
import Button from "../Button";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {

    const navigate = useNavigate();

    const onLogout = async (e) => {
        try {
            e.preventDefault()

            const formData = new FormData();
            formData.append("token", localStorage.getItem("token"))

            const response = await fetch(baseUrl + "auth/logout.php",
                {
                    body: formData,
                    method: "POST"
                }

            )

            await response.json()
            localStorage.clear()
            navigate("/login")
            toast.success("Logged out successfully")

        } catch (error) {
            console.log(error)
            toast.error("Something went wrong")
        }
    }

    return (<>
        <Button label={"Logout"} onClick={onLogout} />
    </>);
}

export default LogoutButton;
