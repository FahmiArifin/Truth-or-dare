/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  ariaDescribedBy?: string;
}

export default function Modal({ isOpen, onClose, title, children, ariaDescribedBy }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save previously focused element to return focus later
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Ensure key listening is captured
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab') {
          if (!modalRef.current) return;

          // Find all focusable elements
          const focusableElementsString =
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
          const focusableElements = Array.from(
            modalRef.current.querySelectorAll(focusableElementsString)
          ) as HTMLElement[];

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Focus the first focusable element inside modal OR the container itself
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = Array.from(
            modalRef.current.querySelectorAll(
              'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
            )
          ) as HTMLElement[];
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={ariaDescribedBy}
    >
      <div
        id="accessible-modal-container"
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-slate-100 font-display flex items-center gap-2"
          >
            {title}
          </h2>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 bg-slate-800/40 hover:bg-slate-800 transition"
            aria-label="Tutup jendela modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}
