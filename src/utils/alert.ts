import Swal from "sweetalert2";
const Alert = Swal.mixin({
  customClass: { popup: "alert-popup", title: "alert-title" },
  confirmButtonText: "好的",
});
export default Alert;
