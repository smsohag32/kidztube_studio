import l from "@/assets/logo/logo2.svg";
const Logo = ({ ...ref }) => {
   return (
      <img
         src={l}
         {...ref}
      />
   );
};

export default Logo;
