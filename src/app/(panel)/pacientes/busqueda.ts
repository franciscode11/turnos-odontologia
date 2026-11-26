export function programarBusqueda<T>(
  consultar: () => Promise<T>,
  alResolver: (resultado: T) => void,
  alFallar: () => void,
  espera = 250,
): () => void {
  let vigente = true;
  const temporizador = setTimeout(() => {
    void consultar().then(
      (resultado) => { if (vigente) alResolver(resultado); },
      () => { if (vigente) alFallar(); },
    );
  }, espera);
  return () => {
    vigente = false;
    clearTimeout(temporizador);
  };
}
