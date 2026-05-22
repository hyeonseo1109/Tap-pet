import { supabase } from "@shared/api";
import { useNavigate } from "react-router-dom";

const eggs = [
  {
    species: "cat",
    name: "고양이 알",
  },
  {
    species: "dog",
    name: "강아지 알",
  },
  {
    species: "rabbit",
    name: "토끼 알",
  },
];

export const SelectEggPage = () => {
  const navigate = useNavigate();

  const handleSelectEgg = async (species: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("pets").insert({
      owner_id: user.id,
      name: "내 펫",
      species,
      is_main: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/main-page");
  };

  return (
    <div>
      <h1>알 선택</h1>

      {eggs.map((egg) => (
        <button key={egg.species} onClick={() => handleSelectEgg(egg.species)}>
          {egg.name}
        </button>
      ))}
    </div>
  );
};
