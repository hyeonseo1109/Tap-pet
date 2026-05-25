import * as styles from "../style.css";

export type PokeToast = {
  id: number;
  senderNickname: string;
};

type PokeToastStackProps = {
  onDismiss: (id: number) => void;
  toasts: PokeToast[];
};

export const PokeToastStack = ({ onDismiss, toasts }: PokeToastStackProps) => {
  return (
    <div className={styles.pokeToastStack} aria-live="polite">
      {toasts.map((toast) => (
        <div className={styles.pokeToast} key={toast.id}>
          <button
            className={styles.pokeToastClose}
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="알림 닫기"
          >
            X
          </button>
          <strong>{toast.senderNickname}님의 콕 찌르기</strong>
          <span>안녕! 그냥 한번 찔러봤어요.</span>
        </div>
      ))}
    </div>
  );
};
