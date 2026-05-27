import { supabase } from "@shared/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as styles from "./style.css";
import { getIdleSprite } from "@entities/character/lib/petSprite";

const eggs = [
  {
    species: "cat",
    name: "고양이 알",
    description: "차분하게 곁을 지키는 친구",
  },
  {
    species: "dog",
    name: "강아지 알",
    description: "활발하고 친절한 친구",
  },
  {
    species: "rabbit",
    name: "토끼 알",
    description: "집중을 잘 하는 소심한 친구",
  },
  {
    species: "chicken",
    name: "닭 알",
    description: "푸드덕푸드덕 천방지축 친구",
  },
];

export const SelectEggPage = () => {
  const navigate = useNavigate();
  const [selectedSpecies, setSelectedSpecies] = useState(eggs[0].species);
  const [petName, setPetName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreatePet = async () => {
    const trimmedName = petName.trim();

    if (!trimmedName) {
      alert("펫 이름을 입력해 주세요.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setIsSaving(true);

    const { error } = await supabase.from("pets").insert({
      owner_id: user.id,
      name: trimmedName,
      species: selectedSpecies,
      is_main: true,
    });

    setIsSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/main-page");
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.kicker}>첫 만남</span>
          <h1 className={styles.title}>함께 키울 알을 골라주세요</h1>
          <p className={styles.notice}>
            입력 내용은 저장하지 않고, 입력 횟수만 성장에 사용합니다.
          </p>
        </div>

        <div className={styles.eggGrid}>
          {eggs.map((egg) => (
            <button
              key={egg.species}
              className={
                selectedSpecies === egg.species
                  ? `${styles.eggCard} ${styles.selectedEggCard}`
                  : styles.eggCard
              }
              onClick={() => setSelectedSpecies(egg.species)}
              type="button"
            >
              <span
                className={styles.eggIcon}
                style={{
                  backgroundImage: `url('${getIdleSprite(egg.species)}')`,
                }}
              />
              <strong>{egg.name}</strong>
              <span className={styles.description}>{egg.description}</span>
            </button>
          ))}
        </div>

        <label className={styles.nameField}>
          <span>펫 이름</span>
          <input
            value={petName}
            maxLength={12}
            onChange={(event) => setPetName(event.target.value)}
            placeholder="이름을 지어주세요"
          />
        </label>

        <button
          className={styles.startButton}
          disabled={isSaving}
          onClick={handleCreatePet}
          type="button"
        >
          {isSaving ? "데려오는 중..." : "데려오기"}
        </button>
      </section>
    </div>
  );
};
