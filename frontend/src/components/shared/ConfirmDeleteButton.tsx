import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { FC, useRef } from "react";

interface IConfirmProps {
  itemName: string;
  onConfirm: (e: any) => void;
  isLoading: boolean;
}

export const ConfirmDeleteButton: FC<IConfirmProps> = ({
  itemName,
  onConfirm,
  isLoading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  return (
    <>
      <Button
        bgColor="#f21111"
        mt="16px"
        width="100%"
        borderRadius="20px"
        color="white"
        isLoading={isLoading}
        _hover={{ bgColor: "primary", opacity: "0.9" }}
        onClick={onOpen}
      >
        Delete {itemName}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete {itemName}
            </AlertDialogHeader>

            <AlertDialogBody color="textPrimary">
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
