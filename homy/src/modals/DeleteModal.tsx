import { useState, useEffect } from "react"

const DeleteModal = () => {
   const [isOpen, setIsOpen] = useState(false);

   useEffect(() => {
      const handleModalToggle = () => {
         setIsOpen(!isOpen);
      };

      // Listen for the modal trigger
      const deleteLinks = document.querySelectorAll('[data-bs-target="#deleteModal"]');
      deleteLinks.forEach(link => {
         link.addEventListener('click', (e) => {
            e.preventDefault();
            setIsOpen(true);
         });
      });

      // Cleanup
      return () => {
         deleteLinks.forEach(link => {
            link.removeEventListener('click', handleModalToggle);
         });
      };
   }, [isOpen]);

   const handleClose = () => {
      setIsOpen(false);
   };

   const handleConfirm = () => {
      // Add your delete account logic here
      console.log('Delete account confirmed');
      setIsOpen(false);
   };

   if (!isOpen) return null;

   return (
      <>
         {/* Custom backdrop */}
         <div
            className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-[1050] tw-flex tw-items-center tw-justify-center"
            onClick={handleClose}
         >
            {/* Modal content */}
            <div
               className="tw-bg-white tw-rounded-lg tw-p-8 tw-max-w-md tw-w-full tw-mx-4 tw-relative tw-z-[1051]"
               onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking modal content
            >
               {/* Close button */}
               <button
                  onClick={handleClose}
                  className="tw-absolute tw-top-4 tw-right-4 tw-text-gray-500 hover:tw-text-gray-700 tw-text-2xl tw-leading-none tw-bg-transparent tw-border-0 tw-cursor-pointer"
               >
                  ×
               </button>

               {/* Modal content */}
               <div className="tw-text-center">
                  <img src="/assets/images/dashboard/icon/icon_22.svg" alt="" className="tw-mx-auto tw-mb-4" />
                  <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Are you sure?</h2>
                  <p className="tw-text-gray-600 tw-mb-6">Are you sure to delete your account? All data will be lost.</p>

                  {/* Buttons */}
                  <div className="tw-flex tw-justify-center tw-gap-4">
                     <button
                        onClick={handleConfirm}
                        className="tw-bg-primary hover:tw-bg-orange-600 tw-text-white tw-px-6 tw-py-2 tw-rounded tw-font-medium tw-transition-colors tw-cursor-pointer"
                     >
                        Yes
                     </button>
                     <button
                        onClick={handleClose}
                        className="tw-bg-gray-800 hover:tw-bg-black tw-text-white tw-px-6 tw-py-2 tw-rounded tw-font-medium tw-transition-colors tw-cursor-pointer"
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </>
   )
}

export default DeleteModal