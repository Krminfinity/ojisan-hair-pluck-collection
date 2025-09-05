export function createOjisanPrompt({ age = "middle", style = "businessman", hairType = "full" }: {
  age?: "young" | "middle" | "senior";
  style?: "businessman" | "casual" | "traditional";
  hairType?: "full" | "thinning" | "receding";
}): { prompt: string; negative_prompt: string } {
  // 年齢・髪型・服装ごとの詳細
  const ageMap = {
    young: "35歳前後、若々しい、爽やか",
    middle: "45歳前後、落ち着いた雰囲気、親しみやすい",
    senior: "55歳以上、白髪交じり、貫禄"
  };
  const styleMap = {
    businessman: "スーツ、ネクタイ、清潔感",
    casual: "カジュアル、シャツ、リラックス",
    traditional: "和装、着物、落ち着き"
  };
  const hairMap = {
    full: "髪の毛が多い、黒髪、整った髪型",
    thinning: "薄毛、頭頂部が薄い、自然な髪型",
    receding: "生え際が後退、額が広い、自然な髪型"
  };
  const prompt = [
    "professional portrait photograph of a Japanese middle-aged businessman,",
    ageMap[age],
    styleMap[style], 
    hairMap[hairType],
    "photorealistic, ultra detailed, 8k uhd, DSLR camera, soft lighting, high quality, film grain, Fujifilm XT3, sharp focus, intricate details, highly detailed, professional photography"
  ].join(", ");
  
  const negative_prompt = [
    "cartoon, anime, drawing, painting, illustration, low quality, blurry, distorted, bad anatomy, deformed, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long neck, long body, monochrome, watermark, signature, text, logo"
  ].join(", ");
  return { prompt, negative_prompt };
}
