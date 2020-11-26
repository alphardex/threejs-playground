import { ref } from "vue";
import ky from "kyouka";

export default () => {
  const showBackdrop = ref(false);
  const isBackdropClosable = ref(true);

  const closeAllDialog = () => {
    showBackdrop.value = false;
  };

  const openDialog = (fn: Function, closable = true) => () => {
    showBackdrop.value = true;
    isBackdropClosable.value = closable;
    fn();
  };

  const openDialogCurry = ky.curry(openDialog);

  return {
    showBackdrop,
    isBackdropClosable,
    closeAllDialog,
  };
};
