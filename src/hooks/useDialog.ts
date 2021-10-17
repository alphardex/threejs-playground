import { ref } from "vue";

export default () => {
  const showBackdrop = ref(false);
  const isBackdropClosable = ref(true);

  const closeAllDialog = () => {
    showBackdrop.value = false;
  };

  const openDialog =
    (fn: Function, closable = true) =>
    () => {
      showBackdrop.value = true;
      isBackdropClosable.value = closable;
      fn();
    };

  return {
    showBackdrop,
    isBackdropClosable,
    closeAllDialog,
    openDialog,
  };
};
