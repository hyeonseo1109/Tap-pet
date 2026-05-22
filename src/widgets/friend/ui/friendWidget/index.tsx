import * as styles from "./style.css";

export const FriendWidget = () => {
  return (
    <div className={styles.friendWidget}>
      <section className={styles.friendSearch}>
        <div>
          <span>친구 탭</span>
          <h2>친구 펫 구경하기</h2>
        </div>
        <label>
          <input placeholder="유저 닉네임 입력" />
          <button type="button">친구 추가</button>
        </label>
      </section>

      <section className={styles.friendList}>
        <article className={styles.friendCard}>
          <div className={styles.friendPet} />
          <div className={styles.friendInfo}>
            <div className={styles.friendName}>
              <strong>친구를 추가해 주세요</strong>
              <span className={styles.offlineDot} />
            </div>
            <p>친구의 대표 펫, 접속 상태, 공개된 성장 정보를 여기에 표시합니다.</p>
            <dl className={styles.statGrid}>
              <div>
                <dt>총 타수</dt>
                <dd>-</dd>
              </div>
              <div>
                <dt>이용시간</dt>
                <dd>-</dd>
              </div>
              <div>
                <dt>레벨</dt>
                <dd>-</dd>
              </div>
              <div>
                <dt>XP</dt>
                <dd>-</dd>
              </div>
            </dl>
          </div>
        </article>
      </section>
    </div>
  );
};
