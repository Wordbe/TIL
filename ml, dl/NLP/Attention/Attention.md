# Attention Mechanism in NLP



## 1 Attention in seq2seq

![](https://lovit.github.io/assets/figures/seq2seq.png)

seq2seq의 흐름은 다음과 같다.

input sequence [A, B, C] → Encoder RNN → Context Vector (= hidden state vectors * attention weights) → Decoder RNN → output sequence [W, X, Y, Z] 



인풋 시퀀스 $x_i$와 아웃풋 시퀀스 $y_i$ 의 상관성 $P(y_i \vert x_i)$ 의 값을 최대로 함을 목표로 학습을 진행합니다.







![](https://lovit.github.io/assets/figures/seq2seq_with_attention.png)

decoder RNN이 $y_i$를 선택할 때, encoder RNN의 $h_j$를 얼마만큼 이용할 지를 attention weight $a_{ij}$로 결정합니다.

즉, context vector $c$는 아래와 같이 정의됩니다.
$$
c_i = \sum_i a_{ij} \cdot h_j
$$
그럼 attention weight은 어떻게 결정되는 것일까요?

![](https://lovit.github.io/assets/figures/seq2seq_attention_input.png)

인코더와 디코더 사이에 layer ($f$)를 하나 추가하여 얻은 출력값 $e$ 의 소프트맥스를 구한 것이 attention weight이 됩니다.

$e$와 $a$는 아래와 같이 나타낼 수 있습니다.
$$
e_{ij} = f(W^1 s_{i-1} + W^2 h_j)
$$

$$
a_{ij} = \frac{exp(e_{ij})}{\sum_j exp(e_{ij})}
$$



여기서 결과물로 attention weight matrix를 얻을 수 있었습니다.

의미가 비슷한 단어들끼리는 실제 높은 attention weight을 얻었습니다.

![](https://lovit.github.io/assets/figures/seq2seq_attention_visualize.png)



## 2 Attention in Encoder-Decoder

## 3 Attention in Sentence Classification

문장의 긍/부정을 분류하기 위해서, 문장 안에 있는 모든 단어들이 필요하지는 않습니다. 문장의 representation을 표현하기 위해 정보를 선택적으로 이용하는데 attention이 도움이 될 수 있습니다.

Lin et al., 2017 은 2 layers feed forward neural networks 를 이용하는 attention network를 제안했습니다.

![](https://lovit.github.io/assets/figures/attention_structured_attention_fig0.png)



문장의 representation은 아래와 같이 표현됩니다.
$$
\text{sent} = \sum_i a_i \cdot h_i
$$
attention weight $a_i$ 는 아래와 같이 계산됩니다.
$$
a = \text{softmax}(w_{s2} \text{tanh}(W_{s1} H^T))
$$
$H$의 크기를 $(n, h)$라 할 때, $W_{s1}$의 크기는 $(d_a, h)$ 가 됩니다. $W_{s1}H^T$는 $(d_a, n)$ 이 되고, 선형변환에 따라 회전변환이 된다고 해석할 수 있습니다. 논문에서 $h=600, n = 350$ 으로 정했으므로, 차원 축소를 통해 필요한 문맥만 선택하는 attention역할을 하게 됩니다. 예를 들어 a , the 등은 문장의 긍정, 부정에 도움이 안될 수 있기 때문에 가능한 해석이라고 생각합니다.

그 후 tanh가 적용되어 벡터를 [-1, 1]로 스케일링합니다. 반지름이 1인 구안에 골고루 벡터가 분포했다고 생각하면 됩니다.

여기에 다시 $d_a = 350$ 차원의 $w_{s2}$가 내적되어서 $w_{s2}$와 비슷한 방향에 있을수록 중요한 문맥이 된다는 의미를 가지게 됩니다. 마지막으로 softmax를 취하기 때문에 확률의 형태로 attention weight가 표현됩니다.

정리하자면, hidden state vectors $H$는 $W_{s1}$에 의해 중요한 문맥 공간으로 변환되었고, $w_{s2}$에 의해 중요한 문맥들을 선택하게 됩니다.



여기에 추가할 것이 있습니다.

어떤 문맥들이 중요한 지는 관점에 따라 다를 수 있으므로, 한 차원의 $(1, d_a)$ $w_{s2}$가 아닌,  다차원의 $(r, d_a)$ $W_{s2}$를 이용합니다. 논문에서는 $r=30$ 으로 실험하였습니다. 그럼 결과적으로 attention matrix A를 얻을 수 있고, 학습을 통해 결과가 가장 좋은 attention weight $a$를 구하면 됩니다.
$$
A = \text{softmax}(W_{s2} \cdot \text{tanh}(W_{s1} \cdot H^T))
$$

$$
\vert A A^T - I \vert_F^2
$$

그리고 각 $r$개의 관점이 연관되어 있지 않은 독립을 보장하기 위한 regulation term을 추가 합니다. 

![](https://lovit.github.io/assets/figures/attention_structured_attention_fig3.png)





## 4 Attention in Document Classification

Yang et al., 2016 은 문서 분류를 위한 attention 메커니즘을 제안하고, Hierarchical Attention Network (HAN) 모델을 만듭니다.

문서는 문서 > 문장 > 단어 의 계층적 구조를 가지며, 모델이 이를 잘 이용해야 한다고 주장합니다.

논문은 다섯 개의 sub network(word encoder, word attention, sentence encoder, sentence attention, classifier) 로 구성된 구조를 제안합니다. 

한 문장 $s_i$ 의 representation을 학습하기 위해 word-level BiGRU가 이용됩니다. 
$$
\begin{gather}
u_{it} = \text{tanh}(W_w h_{it} + b_w) \newline
a_{it} = \text{softmax}(u_{it}^T u_w) \newline
s_i = \sum_t a_{it}h_{it}
\end{gather}
$$
한 문장에 대한 sentence vector $s_i$를 얻을 수 있습니다. 여기서 비슷한 방식으로 문장들의 흐름을 학습하기 위해 sentence-level BiGRU를 학습합니다. 이로써 document representation $v$ 를 얻을 수 있습니다.
$$
\begin{gather}
u_{i} = \text{tanh}(W_w h_{i} + b_s) \newline
a_{i} = \text{softmax}(u_{i}^T u_s) \newline
v = \sum_t a_{i}h_{i}
\end{gather}
$$
![](https://lovit.github.io/assets/figures/attention_han_structure.png)





## 5 Transformer (self-attention)

HAN 까지는 word, sentence encoder를 RNN 계열 모델들로 이용했습니다. 하지만, 이는 한계가 있습니다. 첫째로 모델의 크기가 큽니다. 둘째로 RNN은 반드시 sequence 마지막 부분까지 계산이 완료되어야 학습할 수 있으므로, 하나의 시퀀스에 대한 병렬적 작업을 처리하지 못합니다. 셋째로 RNN 은 local context만 저장하는 문제를 보안하기 위해 LSTM, GRU 모델이 제안되었지만, 이들도 long dependency 를 잘 학습하지는 못합니다. 마지막으로 멀리 떨어진 두 단어의 정보가 하나의 context vector에 포함되려면 여러번의 행렬 곱셈이 필요합니다.

Self-attention 은 이를 해결하기 위한 방법으로, feed-forward neural network만을 이용하여 encoder, decoder, attention network를 모두 구축한 시스템입니다. 



![](https://lovit.github.io/assets/figures/attention_transformer_components.png)

Transformer는 6개의 층의 (transformer block(encoder-decoder) + attention )으로 되어있습니다.



transformer block의 인풋과 아웃풋의 크기는 같습니다.

처음에 임베딩된 input sequence가 들어가고 아래 절차를 따라갑니다.

1) Scaled Dot-Product Attention

* 입력받은 sequence item $x_i$을 세 종류의 차원 $q_i, k_i, v_i$로 변환합니다. query, key, value로 불립니다. query $q_i$와 key $k_j$는 $x_i, x_j$의 상관성을 나타냅니다.

* Attention weight $a_{ij}$는 $f(q_i, k_j)$ 로 계산됩니다. 여기에 가중평균 value $v_j$가 곱해서 최종 representation을 학습합니다.

* Transformer는 정보를 더하는 additive attention이 아닌, 내적하는 multiplicative attention을 구합니다.

* 벡터 차원이 커질수록 내적값이 커지므로 softmax 값은 극단적일 수 있으므로, 스케일링을 위해 $\sqrt{d_k}$로 나누어 줍니다.

* 이로써 scaled dot-product attention, $\text{attention}(q_i, k_j, v_j)$는 아래와 같이 표현할 수 있습니다.
  $$
  \text{softmax}(\frac{q_i \cdot K}{\sqrt{d_k}})V
  $$
  ![](https://lovit.github.io/assets/figures/attention_transformer_block_scaledot.png)

  이렇게 만들어진 head attention을 여러개 만든 것이 multi-head attention입니다. 더 다양한 정보를 얻기 위함입니다.

  이 정보를 정리하기 위해, 위 결과를 ReLU가 포함된 2 layer feed forward network에 입력합니다.
  $$
  FFN(x_i) = \text{max}(0, x_iW_1 + b_1)W_2 + b_2
  $$
  ![](https://lovit.github.io/assets/figures/attention_transformer_block_feedforward.png)

  위의 까지의 과정은 한 문장에서 각 시점별로 문장 정보를 종합하여 새로운 문맥정보를 만드는 과정입니다.

  우리는 모든 시점을 고려한 문맥을 얻고싶으므로, residual connection을 추가합니다.

  ![](https://lovit.github.io/assets/figures/attention_transformer_block_residual.png)



이 과정까지하면 encoder에서 한 번의 transformer block을 통과한 것입니다. 이제 이 과정을 6번 거침으로써, 전체 문장에서 문맥적인 의미들이 추가됩니다.

Encoder는 주어진 문장 전체를 살펴보면서 좋은 representation을 찾아 encoding하는 역할을 하고, Decoder는 현재까지 알려진 정보를 통해 새로운 문장을 생성하는 역할을 합니다. 때문에 decoder는 현재 이후 시점의  attention을 사용할 수 없습니다. 즉, 이전 시점까지로 attention을 제약해야하고 이것을 masking이라고 합니다.



![](https://lovit.github.io/assets/figures/attention_transformer_block_decoder.png)

Decoder가 단어를 생성할 때 encoder의 정보도 필요합니다.

Transformer에서는 encoder의 마지막 layer의 output sequence의 값을 key, value로 이용합니다. 이를 encoder-decoder attention이라고 합니다. 이처럼 query와 key, value의 출처가 다른 경우를 attention이라고 합니다. 하지만, 앞서 설명한 encoder와 decoder의 경우 query, key, value 모두 출처가 자기 자신이었습니다. 이를 self-attention 이라고 합니다.

![](https://lovit.github.io/assets/figures/attention_transformer_components2.png)

이렇게 마들어진 encoder-decoder attention에 feed-forward network를 추가하게 된것이 decoder의 transformer block입니다.





 

## 6 BERT (language model using transformer)

**BERT(Bidirectional Encoder Representation from Transformer)**는 Transformer를 이용하여 학습한 언어 모델 입니다. BERT는 pre-trained model 로, 여기에 sentence classification 이나 sequential labeling 를 추가하여 fine-tuning 하여 이용합니다. BERT 는 Transformer 의 구조를 이해하면 구조적으로는 특별한 점은 없습니다.



BERT의 아키텍처는 **Attention is all you need**에서 소개된 **Transformer**를 사용하지만, pre-training과 fine-tuning시의 아키텍처를 조금 다르게하여 **Transfer Learning**을 용이하게 만드는 것이 핵심입니다.

![](https://lovit.github.io/assets/figures/attention_bert_input.png)



MLM (Masked Language Model)

NSP Task



