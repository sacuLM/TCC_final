# **1.0 Propósito** 

	O projeto cumpre o propósito de registrar avaliações de jogos eletrônicos, bem como armazená-las para posterior consulta. Ele serve como um sistema visual de construção de um catálogo.

# **2.0 Requisitos funcionais**

* Cadastro/login do usuário  
* Cadastro de jogos \-\> Inserção de dados do jogo e catalogação  
* Exibição da lista de jogos  
* Avaliação  
* Resenha  
* Definir status do jogo(quero jogar, jogando, zerado, etc.)  
* Edição de registros  
* Exclusão de registros  
* Perfil de jogos  
* Marcação de favoritos  
* Logout  
* Mecanismo de busca e filtro

**3.0 Requisitos não funcionais**

* Adaptação das telas  
* Compatibilidade com diferentes navegadores  
* Limitação das notas de 1 \- 10  
* Feedback do sistema(operação realizada com sucesso?)  
* Limite de caracteres da resenha  
* Campos obrigatórios do usuário: usuário, senha, email  
* Tipo de imagem permitidas: JPG, JPEG e PNG  
* Limite de caracteres do título

**4.0 Modelagem de Dados**

* **Extração:**  
  * O **usuário** faz login ou cadastro para entrar em sua conta, tendo um *usuário, senha e email.*  
  * O **usuário** possui um **catálogo** de **jogos**  
  * O **usuário** registra um **jogo**, contendo uma *nota*, *resenha, status e gênero*  
  * O **usuário** edita as informações dos **jogos**  
  * O **usuário** exclui as informações ou o próprio **jogo**.  
  * O **usuário** usa o **mecanismo de busca**, este contém um ***filtro de pesquisa**,* que contempla uma ordenação por *nota, nome e favoritos*  
  * O **usuário** pode marcar um **jogo** como favorito  
* **Diagrama Entidade-Relacionamento**  
  * *Um* **usuário** pode ter *Um* **catálogo** com *Muitas* **avaliações.**  
  * *Um* **usuário** pode ter *vários* dados  
  * *Um* **jogo** pode ter *várias* informações  
  * *Um* **mecanismo de busca** contém *Um* **filtro de pesquisa**, que possui *várias* **informações**.

* **Modelo relacional**  
  * **Usuário:**

    

| ATRIBUTO | TIPO | RESTRIÇÃO |
| :---- | :---- | :---- |
| id\_usuario | int | **pk**, not null |
| email | varchar(50) | not null, unique |
| senha | varchar(10) | not null |

  * **Avaliação:**

    

| ATRIBUTO | TIPO | RESTRIÇÃO |
| :---- | :---- | :---- |
| id\_avaliacao | int | **pk**, not null |
| nome | varchar(100) | not null |
| nota | decimal | not null, check |
| resenha | text | not null |
| status | varchar(20) | not null |
| id\_usuario | int | **fk**, not null |
| genero | varchar(20) | not null |

    

	

	