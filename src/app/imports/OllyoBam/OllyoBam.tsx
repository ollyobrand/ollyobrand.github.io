import svgPaths from "./svg-4u1nkb66rw";
import imgImageWithFallback from "./7efdf963b465ea840cf15b3e1ac80db6d73ce1bb.png";

function ImageWithFallback() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ImageWithFallback">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImageWithFallback} />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative rounded-[99px] shrink-0 size-[32px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <ImageWithFallback />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[24px] relative shrink-0 w-[129.438px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-0.5px] tracking-[-0.7125px] whitespace-nowrap">Ollyo Brand Assets</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0" data-name="Container">
      <Container3 />
      <Text />
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[99px] top-0 w-[448px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip pl-[40px] pr-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] tracking-[-0.1504px] whitespace-nowrap">Search product or asset...</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[99px]" />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[36px] relative shrink-0 w-[448px]" data-name="Container">
      <Input />
      <Icon />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-white h-[81px] relative rounded-[99px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[48px] h-full items-start pb-px pt-[24px] px-[24px] relative">
        <Container2 />
        <Container4 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
        <g id="Icon">
          <path d={svgPaths.p1890d180} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d="M32 58.6667V32" id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d={svgPaths.p34d6e900} id="Vector_3" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d="M20 11.3867L44 25.12" id="Vector_4" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
        </g>
      </svg>
    </div>
  );
}

function ProductCard() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex items-center justify-center left-[24px] overflow-clip px-[111.375px] rounded-[10px] size-[286.75px] top-[24px]" data-name="ProductCard">
      <Icon1 />
    </div>
  );
}

function ProductCard1() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[326.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">Growfund</p>
    </div>
  );
}

function ProductCard2() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[354.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6a7282] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">No tagline yet</p>
    </div>
  );
}

function CardContent() {
  return (
    <div className="h-[378.75px] relative shrink-0 w-[334.75px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ProductCard />
        <ProductCard1 />
        <ProductCard2 />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center tracking-[-0.1504px] whitespace-nowrap">View Assets</p>
        </div>
      </div>
    </div>
  );
}

function CardFooter() {
  return (
    <div className="h-[60px] relative shrink-0 w-[334.75px]" data-name="CardFooter">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative size-full">
        <Button />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] h-[467.75px] items-start p-px relative rounded-[14px] shrink-0 w-[336.75px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent />
      <CardFooter />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
        <g id="Icon">
          <path d={svgPaths.p1890d180} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d="M32 58.6667V32" id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d={svgPaths.p34d6e900} id="Vector_3" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d="M20 11.3867L44 25.12" id="Vector_4" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
        </g>
      </svg>
    </div>
  );
}

function ProductCard3() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex items-center justify-center left-[24px] overflow-clip px-[111.375px] rounded-[10px] size-[286.75px] top-[24px]" data-name="ProductCard">
      <Icon2 />
    </div>
  );
}

function ProductCard4() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[326.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">Growfund</p>
    </div>
  );
}

function ProductCard5() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[354.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6a7282] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">No tagline yet</p>
    </div>
  );
}

function CardContent1() {
  return (
    <div className="h-[378.75px] relative shrink-0 w-[334.75px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ProductCard3 />
        <ProductCard4 />
        <ProductCard5 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center tracking-[-0.1504px] whitespace-nowrap">View Assets</p>
        </div>
      </div>
    </div>
  );
}

function CardFooter1() {
  return (
    <div className="h-[60px] relative shrink-0 w-[334.75px]" data-name="CardFooter">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative size-full">
        <Button1 />
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] h-[467.75px] items-start p-px relative rounded-[14px] shrink-0 w-[336.75px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent1 />
      <CardFooter1 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
        <g id="Icon">
          <path d={svgPaths.p1890d180} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d="M32 58.6667V32" id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d={svgPaths.p34d6e900} id="Vector_3" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
          <path d="M20 11.3867L44 25.12" id="Vector_4" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
        </g>
      </svg>
    </div>
  );
}

function ProductCard6() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex items-center justify-center left-[24px] overflow-clip px-[111.375px] rounded-[10px] size-[286.75px] top-[24px]" data-name="ProductCard">
      <Icon3 />
    </div>
  );
}

function ProductCard7() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[326.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">Growfund</p>
    </div>
  );
}

function ProductCard8() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[354.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6a7282] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">No tagline yet</p>
    </div>
  );
}

function CardContent2() {
  return (
    <div className="h-[378.75px] relative shrink-0 w-[334.75px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ProductCard6 />
        <ProductCard7 />
        <ProductCard8 />
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center tracking-[-0.1504px] whitespace-nowrap">View Assets</p>
        </div>
      </div>
    </div>
  );
}

function CardFooter2() {
  return (
    <div className="h-[60px] relative shrink-0 w-[334.75px]" data-name="CardFooter">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative size-full">
        <Button2 />
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] h-[467.75px] items-start p-px relative rounded-[14px] shrink-0 w-[336.75px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent2 />
      <CardFooter2 />
    </div>
  );
}

function ImageWithFallback1() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="ImageWithFallback">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
        <g clipPath="url(#clip0_20_533)" id="ImageWithFallback">
          <path d="M80 0H0V80H80V0Z" fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p3d544f80} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p17ac0d00} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_3" />
          <path clipRule="evenodd" d={svgPaths.p1c35600} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_20_533">
            <rect fill="white" height="80" width="80" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ProductCard9() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex items-center justify-center left-[24px] overflow-clip px-[103.375px] rounded-[10px] size-[286.75px] top-[24px]" data-name="ProductCard">
      <ImageWithFallback1 />
    </div>
  );
}

function ProductCard10() {
  return (
    <div className="absolute h-[27px] left-[24px] top-[326.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[27px] left-0 not-italic text-[#101828] text-[18px] top-[0.5px] tracking-[-0.4395px] whitespace-nowrap">Tutor LMS</p>
    </div>
  );
}

function ProductCard11() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[357.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6a7282] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">eLearning solution that works for you</p>
    </div>
  );
}

function CardContent3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[334.75px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ProductCard9 />
        <ProductCard10 />
        <ProductCard11 />
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center tracking-[-0.1504px] whitespace-nowrap">View Assets</p>
        </div>
      </div>
    </div>
  );
}

function CardFooter3() {
  return (
    <div className="h-[60px] relative shrink-0 w-[334.75px]" data-name="CardFooter">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative size-full">
        <Button3 />
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] h-[467.75px] items-start p-px relative rounded-[14px] shrink-0 w-[336.75px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent3 />
      <CardFooter3 />
    </div>
  );
}

function ImageWithFallback2() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="ImageWithFallback">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
        <g clipPath="url(#clip0_20_533)" id="ImageWithFallback">
          <path d="M80 0H0V80H80V0Z" fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p3d544f80} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p17ac0d00} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_3" />
          <path clipRule="evenodd" d={svgPaths.p1c35600} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_20_533">
            <rect fill="white" height="80" width="80" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ProductCard12() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex items-center justify-center left-[24px] overflow-clip px-[103.375px] rounded-[10px] size-[286.75px] top-[24px]" data-name="ProductCard">
      <ImageWithFallback2 />
    </div>
  );
}

function ProductCard13() {
  return (
    <div className="absolute h-[27px] left-[24px] top-[326.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[27px] left-0 not-italic text-[#101828] text-[18px] top-[0.5px] tracking-[-0.4395px] whitespace-nowrap">Tutor LMS</p>
    </div>
  );
}

function ProductCard14() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[357.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6a7282] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">eLearning solution that works for you</p>
    </div>
  );
}

function CardContent4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[334.75px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ProductCard12 />
        <ProductCard13 />
        <ProductCard14 />
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center tracking-[-0.1504px] whitespace-nowrap">View Assets</p>
        </div>
      </div>
    </div>
  );
}

function CardFooter4() {
  return (
    <div className="h-[60px] relative shrink-0 w-[334.75px]" data-name="CardFooter">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative size-full">
        <Button4 />
      </div>
    </div>
  );
}

function Card4() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] h-[467.75px] items-start p-px relative rounded-[14px] shrink-0 w-[336.75px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent4 />
      <CardFooter4 />
    </div>
  );
}

function ImageWithFallback3() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="ImageWithFallback">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
        <g clipPath="url(#clip0_20_533)" id="ImageWithFallback">
          <path d="M80 0H0V80H80V0Z" fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p3d544f80} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p17ac0d00} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_3" />
          <path clipRule="evenodd" d={svgPaths.p1c35600} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_20_533">
            <rect fill="white" height="80" width="80" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ProductCard15() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex items-center justify-center left-[24px] overflow-clip px-[103.375px] rounded-[10px] size-[286.75px] top-[24px]" data-name="ProductCard">
      <ImageWithFallback3 />
    </div>
  );
}

function ProductCard16() {
  return (
    <div className="absolute h-[27px] left-[24px] top-[326.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[27px] left-0 not-italic text-[#101828] text-[18px] top-[0.5px] tracking-[-0.4395px] whitespace-nowrap">Tutor LMS</p>
    </div>
  );
}

function ProductCard17() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[357.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6a7282] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">eLearning solution that works for you</p>
    </div>
  );
}

function CardContent5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[334.75px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ProductCard15 />
        <ProductCard16 />
        <ProductCard17 />
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center tracking-[-0.1504px] whitespace-nowrap">View Assets</p>
        </div>
      </div>
    </div>
  );
}

function CardFooter5() {
  return (
    <div className="h-[60px] relative shrink-0 w-[334.75px]" data-name="CardFooter">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative size-full">
        <Button5 />
      </div>
    </div>
  );
}

function Card5() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] h-[467.75px] items-start p-px relative rounded-[14px] shrink-0 w-[336.75px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent5 />
      <CardFooter5 />
    </div>
  );
}

function ImageWithFallback4() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="ImageWithFallback">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
        <g clipPath="url(#clip0_20_533)" id="ImageWithFallback">
          <path d="M80 0H0V80H80V0Z" fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p3d544f80} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p17ac0d00} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_3" />
          <path clipRule="evenodd" d={svgPaths.p1c35600} fill="var(--fill-0, #0049F8)" fillRule="evenodd" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_20_533">
            <rect fill="white" height="80" width="80" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ProductCard18() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex items-center justify-center left-[24px] overflow-clip px-[103.375px] rounded-[10px] size-[286.75px] top-[24px]" data-name="ProductCard">
      <ImageWithFallback4 />
    </div>
  );
}

function ProductCard19() {
  return (
    <div className="absolute h-[27px] left-[24px] top-[326.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[27px] left-0 not-italic text-[#101828] text-[18px] top-[0.5px] tracking-[-0.4395px] whitespace-nowrap">Tutor LMS</p>
    </div>
  );
}

function ProductCard20() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[357.75px] w-[286.75px]" data-name="ProductCard">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6a7282] text-[16px] top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">eLearning solution that works for you</p>
    </div>
  );
}

function CardContent6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[334.75px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ProductCard18 />
        <ProductCard19 />
        <ProductCard20 />
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center tracking-[-0.1504px] whitespace-nowrap">View Assets</p>
        </div>
      </div>
    </div>
  );
}

function CardFooter6() {
  return (
    <div className="h-[60px] relative shrink-0 w-[334.75px]" data-name="CardFooter">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative size-full">
        <Button6 />
      </div>
    </div>
  );
}

function Card6() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] h-[467.75px] items-start p-px relative rounded-[14px] shrink-0 w-[336.75px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent6 />
      <CardFooter6 />
    </div>
  );
}

function ProductGrid() {
  return (
    <div className="relative shrink-0 w-full" data-name="ProductGrid">
      <div className="flex flex-row justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-start flex flex-wrap gap-[24px] items-start justify-center pt-[32px] px-[32px] relative w-full">
          <Card />
          <Card1 />
          <Card2 />
          <Card3 />
          <Card4 />
          <Card5 />
          <Card6 />
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="flex-[1483_0_0] h-[1173px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center overflow-clip pt-[40px] relative rounded-[inherit] size-full">
        <Container1 />
        <ProductGrid />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="bg-[#f9fafb] content-stretch flex h-[1173px] items-start relative shrink-0 w-full" data-name="App">
      <Container />
    </div>
  );
}

export default function OllyoBam() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full" data-name="Ollyo BAM">
      <App />
    </div>
  );
}