import { Modal, Box, TextField, Button } from "@mui/material";
import { createAllergen, getAllergenById, updateAllergen } from "../../api/allergenApi";
import { useEffect, useState } from "react";
import { AllergenDTO } from "../../types/types";
import { Toast } from "../ToastComponent";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

interface AllergenProps {
    open: boolean,
    allergen: AllergenDTO,
    handleClose: () => void,
    setAllergens: React.Dispatch<React.SetStateAction<AllergenDTO[]>>,
    title: string,
    action: string,
}

const initialState: AllergenDTO = {
    allergenId: 0,
    name: "",
    description: "",
}

export default function AllergenModal({ open,
    allergen,
    handleClose,
    setAllergens,
    title,
    action }: AllergenProps) {

    const schema = yup.object().shape({
        name: yup.string().required("Vui lòng nhập tên thành phần").min(2, 'Tên thành phần có số ký tự từ 2 - 50')
            .max(50, 'Tên thành phần có số ký tự từ 2 - 50'),
        description: yup.string().required("Vui lòng nhập mô tả").min(10, 'Mô tả có số ký tự từ 10 trở lên')
    })

    const [openToast, setOpenToast] = useState<boolean>(false);
    const [statusCode, setStatusCode] = useState<number>(0);
    const [information, setInformation] = useState<string>('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AllergenDTO>({
        resolver: yupResolver(schema),
        defaultValues: initialState
    });

    useEffect(() => {
        if (allergen) {
            reset(allergen)
        }
    }, [allergen, reset]);

    const handleCloseToast = () => {
        setOpenToast(false);
    };

    const onToast = (status: number, open: boolean, info: string) => {
        setStatusCode(status);
        setOpenToast(open);
        setInformation(info);
    };

    const onSubmit: SubmitHandler<AllergenDTO> = async (formData) => {

        if (!formData) return;

        try {
            let response: AllergenDTO | null = null;

            if (action === "update") {
                if (!formData.allergenId) {
                    throw new Error("Missing allergenId for update");
                }
                response = await updateAllergen(formData.allergenId, formData);
            } else if (action === "create") {
                response = await createAllergen(formData);
            }

            if (response) {
                setAllergens((prev) =>
                    action === "update"
                        ? prev.map((a) => (a.allergenId === formData.allergenId ? response : a))
                        : [...prev, response]
                );
                onToast(200, true, `Thành phần dị ứng mới đã ${action === "update" ? "cập nhật" : "tạo"} thành công.`);
                handleClose();
            }

        } catch (error) {
            onToast(500, true, "Có lỗi xảy ra trong quá trình xử lý thành phần dị ứng.");
        }
    }

    return (
        <>
            <Toast
                onClose={handleCloseToast}
                information={information}
                open={openToast}
                statusCode={statusCode}
            />

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)", // Centers the modal
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 3, // Padding inside the modal
                        minWidth: 400, // Ensures the modal is wide enough for the form
                        maxWidth: 600, // Prevents it from being too large
                        borderRadius: 2, // Adds rounded corners
                    }}
                >
                    <h2>{title}</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            fullWidth
                            label="Tên thành phần"
                            {...register('name')}
                            variant="outlined"
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                        <TextField
                            fullWidth
                            label="Mô tả"
                            {...register('description')}
                            variant="outlined"
                            margin="normal"
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />
                        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                            <Button variant="outlined" onClick={handleClose}>Hủy</Button>
                            <Button type="submit" variant="contained" color="primary">Lưu</Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
        </>
    )
}