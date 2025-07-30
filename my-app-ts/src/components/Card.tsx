interface ICard{
    id:number,
    paragraph:string,
    details:string
}

export const Card = ({ id, paragraph, details }: ICard) => {
  return (
    <div className="card">
      <h2>ICard {id} </h2>
      <p>({paragraph})</p>
      <p>({details})</p>
    </div>
  );
}   
